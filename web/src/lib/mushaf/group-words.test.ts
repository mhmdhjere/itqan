import { describe, expect, it } from "vitest";
import { groupWordsByAyah } from "@/lib/mushaf/group-words";

describe("groupWordsByAyah", () => {
  it("groups consecutive words by ayah", () => {
    const groups = groupWordsByAyah([
      { location: "78:1:1", word: "عَمَّ" },
      { location: "78:1:2", word: "يَتَسَآءَلُونَ ١" },
      { location: "78:2:1", word: "عَنِ" },
      { location: "78:2:2", word: "ٱلنَّبَإِ" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ surah: 78, ayah: 1 });
    expect(groups[1]).toMatchObject({ surah: 78, ayah: 2 });
    expect(groups[0]!.text).toContain("عَمَّ");
  });
});
