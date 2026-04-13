import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageToggle from "@/components/language-toggle";
import { LanguageProvider } from "@/components/language-provider";

const routerRefresh = vi.fn();
let storage: Record<string, string> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: routerRefresh,
  }),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    routerRefresh.mockReset();
    storage = {};
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: (key: string) => {
          delete storage[key];
        },
      },
    });
    document.cookie = "ds-language=; Max-Age=0; Path=/";
  });

  it("persists the selected language before refreshing the route", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider initialLanguage="en">
        <LanguageToggle />
      </LanguageProvider>,
    );

    await user.click(screen.getByRole("button", { name: "ID" }));

    expect(storage["ds-language"]).toBe("id");
    expect(document.cookie).toContain("ds-language=id");
    expect(document.documentElement.lang).toBe("id");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});
