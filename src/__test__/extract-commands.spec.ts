import { readFileSync } from "fs";
import { extractCommands } from "../extract-commands";

describe("extract-commands", () => {
    const config = JSON.parse(readFileSync("./example.json").toString());

    it("should extract nothing", () => {
        const body = "This is a comment.";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([]);
    });

    it("should extract /kind bug", () => {
        const body = "This is a comment.\r\n/kind bug";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "add-label", arg: "kind/bug", dispatch: undefined }]);
    });

    it("should extract /remove-lifecycle frozen", () => {
        const body = "This is a comment.\r\n/remove-lifecycle frozen";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "remove-label", arg: "lifecycle/frozen", dispatch: undefined }]);
    });

    it("should not extract /remove-lifecycle", () => {
        const body = "This is a comment.\r\n/remove-lifecycle ";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([]);
    });

    it("should not extract /remove-lifecycle blub", () => {
        const body = "This is a comment.\r\n/remove-lifecycle blub";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([]);
    });

    it("should extract /label foo", () => {
        const body = "/label foo\r\nThis is a comment.";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "add-label", arg: "foo", dispatch: undefined }]);
    });

    it("should extract /hold", () => {
        const body = "/hold \r\nThis is a comment.";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "add-label", arg: "hold", dispatch: undefined }]);
    });

    it("should extract /hold cancel", () => {
        const body = "/hold cancel\r\nThis is a comment.";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "remove-label", arg: "hold", dispatch: undefined }]);
    });

    it("should extract /approved with dispatch event", () => {
        const body = "/approved\r\nThis is a comment.";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "add-label", arg: "approved", dispatch: "approved" }]);
    });

    it("should extract multiple commands 1", () => {
        const body = "/hold\r\nThis is a comment.\r\n/kind bug";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([
            { command: "add-label", arg: "hold", dispatch: undefined },
            { command: "add-label", arg: "kind/bug", dispatch: undefined }
        ]);
    });

    it("should extract multiple commands 2", () => {
        const body = "/hold\r\nThis is a comment.\r\n/kind bug /kind enhancement";

        const extracted = extractCommands(body, config.commands);
        expect(extracted).toStrictEqual([{ command: "add-label", arg: "hold", dispatch: undefined }]);
    });
});
