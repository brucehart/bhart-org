export const ARTICLE_AGENT_RUNNER = String.raw`#!/usr/bin/env python3
import json
import hashlib
import os
import pathlib
import pty
import re
import select
import shlex
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request


BASE_URL = os.environ["BHART_ARTICLE_AGENT_BASE_URL"].rstrip("/")
JOB_ID = os.environ["BHART_ARTICLE_AGENT_JOB_ID"]
JOB_TOKEN = os.environ["BHART_ARTICLE_AGENT_TOKEN"]
WORKDIR = os.environ.get("BHART_ARTICLE_AGENT_WORKDIR", "/home/sprite/bhart-org/main")
CODEX_API_BASE = os.environ.get("BHART_CODEX_API_BASE", "https://bhart.org/api/codex/v1")
SECRETS_PATH = pathlib.Path.home() / ".config" / "secrets" / "codex.env"
TASK_NAME = os.environ.get("BHART_ARTICLE_AGENT_TASK_NAME") or re.sub(
    r"[^a-z0-9-]+",
    "-",
    ("article-agent-" + JOB_ID).lower(),
).strip("-")
TASK_EXPIRE = "5m"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
ANSI_RE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]|\x1b\][^\x07]*(?:\x07|\x1b\\)")


def token_hash_prefix():
    return hashlib.sha256(JOB_TOKEN.encode("utf-8")).hexdigest()[:12]


def parse_env_value(raw):
    lexer = shlex.shlex(raw, posix=True)
    lexer.whitespace_split = True
    lexer.commenters = "#"
    parts = list(lexer)
    return " ".join(parts)


def load_secret_env():
    if SECRETS_PATH.exists():
        for raw_line in SECRETS_PATH.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[len("export ") :].strip()
            name, sep, raw_value = line.partition("=")
            name = name.strip()
            if sep and name and not os.environ.get(name):
                os.environ[name] = parse_env_value(raw_value.strip())
    if not os.environ.get("BHART_CODEX_API_BASE"):
        os.environ["BHART_CODEX_API_BASE"] = CODEX_API_BASE


def api_request(method, path, payload=None, timeout=30):
    data = None
    headers = {
        "Authorization": "Bearer " + JOB_TOKEN,
        "Accept": "application/json",
        "User-Agent": USER_AGENT,
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE_URL + path, method=method, headers=headers, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        body = response.read()
        if not body:
            return {}
        return json.loads(body.decode("utf-8"))


def task_request(method, path, payload=None):
    cmd = [
        "curl",
        "-fsS",
        "--unix-socket",
        "/.sprite/api.sock",
        "-X",
        method,
        "http://sprite" + path,
    ]
    if payload is not None:
        cmd.extend(["-H", "Content-Type: application/json", "-d", json.dumps(payload)])
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)


def refresh_task():
    task_request("PUT", "/v1/tasks/" + urllib.parse.quote(TASK_NAME), {"expire": TASK_EXPIRE})


def release_task():
    subprocess.run(
        [
            "curl",
            "-fsS",
            "--unix-socket",
            "/.sprite/api.sock",
            "-X",
            "DELETE",
            "http://sprite/v1/tasks/" + urllib.parse.quote(TASK_NAME),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )


def heartbeat_task(stop_event):
    while not stop_event.wait(60):
        try:
            refresh_task()
        except Exception as exc:
            post_event("warning", "Could not refresh Sprite task hold: " + str(exc))


def post_event(event_type, message, metadata=None):
    try:
        api_request(
            "POST",
            "/api/article-agent/jobs/" + urllib.parse.quote(JOB_ID) + "/events",
            {"type": event_type, "message": message, "metadata": metadata or {}},
            timeout=10,
        )
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print(
            "failed to post event: HTTP Error "
            + str(exc.code)
            + ": "
            + detail[:500],
            file=sys.stderr,
            flush=True,
        )
    except Exception as exc:
        print("failed to post event: " + str(exc), file=sys.stderr, flush=True)


def patch_job(status, **fields):
    payload = {"status": status}
    payload.update(fields)
    api_request("PATCH", "/api/article-agent/jobs/" + urllib.parse.quote(JOB_ID), payload, timeout=15)


def bootstrap():
    return api_request("GET", "/api/article-agent/jobs/" + urllib.parse.quote(JOB_ID) + "/bootstrap")


def download_refs(refs):
    paths = []
    output_dir = pathlib.Path("/tmp") / ("article-agent-" + JOB_ID)
    output_dir.mkdir(parents=True, exist_ok=True)
    for ref in refs:
        filename = ref.get("filename") or ("reference-" + str(ref.get("id", len(paths) + 1)))
        safe_name = pathlib.Path(filename).name or ("reference-" + str(len(paths) + 1))
        output_path = output_dir / (str(ref.get("id", len(paths) + 1)) + "-" + safe_name)
        req = urllib.request.Request(
            BASE_URL + ref["url"],
            method="GET",
            headers={"Authorization": "Bearer " + JOB_TOKEN, "User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            output_path.write_bytes(response.read())
        paths.append(str(output_path))
    return paths


def build_article_prompt(job, refs, reference_instruction):
    return (
        "Use the draft-article skill in this repository to create and submit a bhart.org blog post draft.\n\n"
        "Article idea:\n"
        + job["prompt"]
        + "\n\nReference file paths:\n"
        + refs
        + "\n\n"
        + reference_instruction
        + "\n\nImportant repository facts:\n"
        "- The existing Blog Automation API base is https://bhart.org/api/codex/v1.\n"
        "- Authenticate with Authorization: Bearer $CODEX_BHART_API_TOKEN.\n"
        "- Use POST /posts for article drafts.\n"
        "- Use POST /media/upload or POST /media/import only if you need media.\n"
        "- Use the existing house style in .codex/skills/draft-article/references/agents.md.\n\n"
        "Run the full workflow and submit a draft through the existing API. Stream useful progress as you work.\n\n"
        "When complete, print exactly one final line beginning with:\n"
        "BHART_ARTICLE_AGENT_RESULT_JSON=\n\n"
        "The marker must be followed by compact JSON containing the actual post_id, slug, title, and status returned by the API. "
        "Do not print placeholder values.\n"
    )


def build_news_prompt(job, refs, reference_instruction):
    return (
        "Use the create-news-item skill in this repository to create and submit a bhart.org news item draft.\n\n"
        "News item idea:\n"
        + job["prompt"]
        + "\n\nReference file paths:\n"
        + refs
        + "\n\n"
        + reference_instruction
        + "\n\nImportant repository facts:\n"
        "- The existing Blog Automation API base is https://bhart.org/api/codex/v1.\n"
        "- Authenticate with Authorization: Bearer $CODEX_BHART_API_TOKEN.\n"
        "- Use POST /news for news item drafts.\n"
        "- News items are short updates, not blog posts. Do not invent tags, summary, or SEO fields.\n"
        "- Use the existing news workflow in .codex/skills/create-news-item/references/agents.md.\n"
        "- Public news links use /news#news-<id>.\n\n"
        "Run the full workflow and submit a draft through the existing API. Stream useful progress as you work.\n\n"
        "When complete, print exactly one final line beginning with:\n"
        "BHART_ARTICLE_AGENT_RESULT_JSON=\n\n"
        "The marker must be followed by compact JSON containing the actual news_id, title, category, and status returned by the API. "
        "Do not print placeholder values.\n"
    )


def build_codex_prompt(job, ref_paths):
    refs = "\n".join("- " + path for path in ref_paths) if ref_paths else "- none"
    reference_instruction = (
        "No reference files were provided."
        if not ref_paths
        else (
            "Reference files are available at the /tmp paths above. "
            "Inspect them directly and use visible details as source material only when relevant."
        )
    )
    if job.get("content_type") == "news":
        return build_news_prompt(job, refs, reference_instruction)
    return build_article_prompt(job, refs, reference_instruction)


def strip_terminal(text):
    return ANSI_RE.sub("", text).replace("\r", "")


def poll_messages(proc, input_fd):
    last_id = 0
    while proc.poll() is None:
        try:
            path = "/api/article-agent/jobs/" + urllib.parse.quote(JOB_ID) + "/messages?after=" + str(last_id)
            data = api_request("GET", path, timeout=10)
            for msg in data.get("messages", []):
                last_id = max(last_id, int(msg["id"]))
                content = msg.get("content", "").strip()
                if content:
                    post_event("feedback", "Forwarding feedback to Codex.")
                    os.write(
                        input_fd,
                        ("\nUser feedback from the admin drafting page:\n" + content + "\n").encode("utf-8"),
                    )
        except Exception as exc:
            post_event("warning", "Could not poll feedback: " + str(exc))
        time.sleep(5)


def parse_result(output, content_type):
    output = strip_terminal(output)
    marker = "BHART_ARTICLE_AGENT_RESULT_JSON="
    for line in reversed(output.splitlines()):
        if marker in line:
            raw = line.split(marker, 1)[1].strip()
            try:
                parsed = json.loads(raw)
                if is_real_result(parsed, content_type):
                    return parsed
            except Exception:
                continue
    result_key = "news_id" if content_type == "news" else "post_id"
    for match in reversed(re.findall(r"\{[^{}]*\"" + re.escape(result_key) + r"\"[^{}]*\}", output)):
        try:
            parsed = json.loads(match)
            if is_real_result(parsed, content_type):
                return parsed
        except Exception:
            continue
    return None


def is_real_result(value, content_type):
    if not isinstance(value, dict):
        return False
    title = str(value.get("title") or "").strip()
    status = str(value.get("status") or "").strip()
    if not title or title in {"Title", "My Post"}:
        return False
    if status not in {"draft", "published"}:
        return False
    if content_type == "news":
        news_id = str(value.get("news_id") or value.get("id") or "").strip()
        category = str(value.get("category") or "").strip()
        if len(news_id) < 8 or news_id in {"123", "example", "uuid", "news_id", "id"}:
            return False
        if not category or category in {"Category", "Example"}:
            return False
        return True
    post_id = str(value.get("post_id") or "").strip()
    slug = str(value.get("slug") or "").strip()
    if len(post_id) < 8 or post_id in {"123", "example", "uuid", "post_id"}:
        return False
    if not slug or slug in {"example", "my-post", "slug"}:
        return False
    return True


def main():
    load_secret_env()
    print("article agent runner started; callback token hash prefix " + token_hash_prefix(), flush=True)
    refresh_task()
    task_stop = threading.Event()
    task_thread = threading.Thread(target=heartbeat_task, args=(task_stop,), daemon=True)
    task_thread.start()
    post_event("status", "Sprite task hold acquired.")
    try:
        job = bootstrap()
        content_type = "news" if job.get("content_type") == "news" else "article"
        patch_job("running")
        if content_type == "news":
            post_event("status", "News item drafting agent started in Sprite.")
        else:
            post_event("status", "Article drafting agent started in Sprite.")
        ref_paths = download_refs(job.get("refs", []))
        if ref_paths:
            post_event("status", "Downloaded " + str(len(ref_paths)) + " reference file(s).")

        prompt = build_codex_prompt(job, ref_paths)
        env = os.environ.copy()
        env["BHART_CODEX_API_BASE"] = env.get("BHART_CODEX_API_BASE") or CODEX_API_BASE
        result_path = pathlib.Path("/tmp") / ("article-agent-" + JOB_ID + "-codex-result.txt")
        try:
            result_path.unlink()
        except FileNotFoundError:
            pass
        cmd = [
            "codex",
            "exec",
            "--dangerously-bypass-approvals-and-sandbox",
            "--cd",
            WORKDIR,
            "--color",
            "never",
            "--output-last-message",
            str(result_path),
        ]
        cmd.append(prompt)
        if content_type == "news":
            post_event("status", "Launching Codex news item draft workflow.")
        else:
            post_event("status", "Launching Codex article draft workflow.")
        master_fd, slave_fd = pty.openpty()
        proc = subprocess.Popen(
            cmd,
            cwd=WORKDIR,
            env=env,
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            close_fds=True,
        )
        os.close(slave_fd)
        post_event("status", "Codex exec process started with pid " + str(proc.pid) + ".")
        thread = threading.Thread(target=poll_messages, args=(proc, master_fd), daemon=True)
        thread.start()

        output_parts = []
        line_buffer = ""
        result = None
        last_output_at = time.time()
        last_idle_event_at = last_output_at
        while True:
            timeout = 0 if proc.poll() is not None else 1
            ready, _, _ = select.select([master_fd], [], [], timeout)
            if not ready:
                if proc.poll() is not None:
                    break
                now = time.time()
                if now - last_output_at > 120 and now - last_idle_event_at > 120:
                    post_event("status", "Codex exec is still running; waiting for output.")
                    last_idle_event_at = now
                continue
            try:
                chunk = os.read(master_fd, 4096)
            except OSError:
                break
            if not chunk:
                break
            text = chunk.decode("utf-8", errors="replace")
            last_output_at = time.time()
            output_parts.append(text)
            line_buffer += text
            while "\n" in line_buffer:
                line, line_buffer = line_buffer.split("\n", 1)
                clean = strip_terminal(line).rstrip()
                if clean:
                    post_event("log", clean)

        if line_buffer:
            clean = strip_terminal(line_buffer).rstrip()
            if clean:
                post_event("log", clean)

        exit_code = proc.wait()
        os.close(master_fd)

        if result_path.exists():
            try:
                final_message = result_path.read_text(encoding="utf-8")
                if final_message:
                    output_parts.append("\n" + final_message)
                    result = parse_result(final_message, content_type)
            except Exception as exc:
                post_event("warning", "Could not read Codex final message: " + str(exc))

        if exit_code != 0:
            patch_job("failed", error="Codex exited with status " + str(exit_code))
            post_event("error", "Codex exited with status " + str(exit_code))
            return exit_code

        if not result:
            result = parse_result("".join(output_parts), content_type)

        if content_type == "news" and result:
            news_id = str(result.get("news_id") or result.get("id") or "")
            if news_id:
                patch_job(
                    "complete",
                    news_id=news_id,
                    news_category=str(result.get("category") or ""),
                    title=str(result.get("title") or ""),
                )
                post_event("complete", "News item draft created.", result)
                return 0

        if content_type == "article" and result and result.get("post_id"):
            patch_job(
                "complete",
                post_id=str(result["post_id"]),
                post_slug=str(result.get("slug") or ""),
                title=str(result.get("title") or ""),
            )
            post_event("complete", "Article draft created.", result)
            return 0

        patch_job("failed", error="Codex completed without a valid result marker.")
        post_event("error", "Codex completed without a valid result marker.")
        return 2
    finally:
        task_stop.set()
        release_task()
        post_event("status", "Sprite task hold released.")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        print("HTTP error " + str(exc.code) + ": " + detail[:500], file=sys.stderr, flush=True)
        post_event("error", "HTTP error " + str(exc.code) + ": " + detail[:500])
        try:
            patch_job("failed", error="HTTP error " + str(exc.code))
        except Exception:
            pass
        raise
    except Exception as exc:
        post_event("error", str(exc))
        try:
            patch_job("failed", error=str(exc))
        except Exception:
            pass
        raise
`;
