/** biome-ignore-all lint/suspicious/noExplicitAny: Allow any in tests */
import ora from "ora";
import * as git from "../lib/git.js";
import type { WorktreeListEntry } from "../lib/types.js";
import * as utils from "../lib/utils.js";
import List from "./list.js";

const spinnerMocks = vi.hoisted(() => {
  const stop = vi.fn();
  const start = vi.fn().mockReturnValue({ stop });
  const oraFactory = vi.fn().mockReturnValue({ start });

  return {
    stop,
    start,
    oraFactory,
  };
});

vi.mock("ora", () => ({
  default: spinnerMocks.oraFactory,
}));

describe("list command", () => {
  let list: List;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockConfig = {
      runCommand: vi.fn().mockResolvedValue(undefined),
    } as any;
    list = new List([], mockConfig);

    (list as any).parse = vi.fn().mockResolvedValue({
      args: {},
      flags: {},
    });
  });

  it("logs each worktree list item", async () => {
    const worktrees: WorktreeListEntry[] = [
      {
        path: "/tmp/project.worktrees/feature/one",
        branchName: "feature/one",
        remote: "origin/feature/one",
      },
      {
        path: "/tmp/project.worktrees/feature/two",
        branchName: "feature/two",
        remote: "origin/feature/two",
      },
    ];

    const mockGetWorktreeList = vi
      .spyOn(git, "gitGetWorktreeList")
      .mockResolvedValue(worktrees);
    const mockListName = vi
      .spyOn(utils, "worktreeListEntryToListName")
      .mockReturnValueOnce("feature/one")
      .mockReturnValueOnce("feature/two (Ahead: 1)");
    const logSpy = vi.spyOn(list, "log").mockImplementation(() => {});

    await list.run();

    expect((list as any).parse).toHaveBeenCalledWith(List);
    expect(mockGetWorktreeList).toHaveBeenCalledWith({ includeCurrent: true });
    expect(ora).toHaveBeenCalledWith("Gathering worktree list");
    expect(spinnerMocks.start).toHaveBeenCalledTimes(1);
    expect(spinnerMocks.stop).toHaveBeenCalledTimes(1);
    expect(mockListName).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(1, "- feature/one");
    expect(logSpy).toHaveBeenNthCalledWith(2, "- feature/two (Ahead: 1)");
  });

  it("does not log entries when no worktrees are returned", async () => {
    vi.spyOn(git, "gitGetWorktreeList").mockResolvedValue([]);
    const mockListName = vi.spyOn(utils, "worktreeListEntryToListName");
    const logSpy = vi.spyOn(list, "log").mockImplementation(() => {});

    await list.run();

    expect(spinnerMocks.start).toHaveBeenCalledTimes(1);
    expect(spinnerMocks.stop).toHaveBeenCalledTimes(1);
    expect(mockListName).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
