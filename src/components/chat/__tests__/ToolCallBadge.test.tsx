import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolCallLabel, ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// getToolCallLabel — str_replace_editor
test("getToolCallLabel: str_replace_editor create in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, false)).toBe("Creating /App.jsx");
});

test("getToolCallLabel: str_replace_editor create done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, true)).toBe("Created /App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }, false)).toBe("Modifying /components/Card.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" }, true)).toBe("Modified /components/Card.jsx");
});

test("getToolCallLabel: str_replace_editor insert in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/index.js" }, false)).toBe("Modifying /index.js");
});

test("getToolCallLabel: str_replace_editor insert done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/index.js" }, true)).toBe("Modified /index.js");
});

test("getToolCallLabel: str_replace_editor view in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, false)).toBe("Reading /App.jsx");
});

test("getToolCallLabel: str_replace_editor view done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, true)).toBe("Reading /App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, false)).toBe("Undoing edit on /App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, true)).toBe("Undid edit on /App.jsx");
});

test("getToolCallLabel: str_replace_editor unknown command falls back to toolName", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/App.jsx" }, false)).toBe("str_replace_editor");
});

test("getToolCallLabel: str_replace_editor no command falls back to toolName", () => {
  expect(getToolCallLabel("str_replace_editor", {}, false)).toBe("str_replace_editor");
});

// getToolCallLabel — file_manager
test("getToolCallLabel: file_manager rename in-progress", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, false)).toBe("Renaming /old.jsx to /new.jsx");
});

test("getToolCallLabel: file_manager rename done", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, true)).toBe("Renamed /old.jsx to /new.jsx");
});

test("getToolCallLabel: file_manager delete in-progress", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/unused.jsx" }, false)).toBe("Deleting /unused.jsx");
});

test("getToolCallLabel: file_manager delete done", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/unused.jsx" }, true)).toBe("Deleted /unused.jsx");
});

test("getToolCallLabel: file_manager unknown command falls back to toolName", () => {
  expect(getToolCallLabel("file_manager", { command: "unknown_cmd" }, false)).toBe("file_manager");
});

// getToolCallLabel — unknown tool
test("getToolCallLabel: unknown tool returns raw toolName", () => {
  expect(getToolCallLabel("some_other_tool", {}, false)).toBe("some_other_tool");
});

test("getToolCallLabel: unknown tool with no args returns raw toolName", () => {
  expect(getToolCallLabel("bash", null, true)).toBe("bash");
});

// ToolCallBadge rendering
test("ToolCallBadge shows spinner when not done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  // Spinner is an svg from lucide (Loader2)
  expect(container.querySelector("svg")).toBeDefined();
  // No green dot
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );

  expect(screen.getByText("Created /App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector("svg")).toBeNull();
});

test("ToolCallBadge treats null result as not done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: null,
      }}
    />
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(container.querySelector("svg")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge renders correct label text", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolName: "file_manager",
        args: { command: "delete", path: "/old.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );

  expect(screen.getByText("Deleted /old.jsx")).toBeDefined();
});
