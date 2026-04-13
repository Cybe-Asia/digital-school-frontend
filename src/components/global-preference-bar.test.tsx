import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalPreferenceBar from "@/components/global-preference-bar";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

const routerRefresh = vi.fn();
let storage: Record<string, string> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: routerRefresh,
  }),
}));

describe("GlobalPreferenceBar", () => {
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
    document.cookie = "ds-theme-id=; Max-Age=0; Path=/";
    document.documentElement.dataset.theme = "option2-light";
    document.documentElement.lang = "en";
  });

  it("starts collapsed and expands the controls on demand", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider initialLanguage="en">
        <ThemeProvider initialThemeId="option2-light">
          <GlobalPreferenceBar />
        </ThemeProvider>
      </LanguageProvider>,
    );

    const toggleButton = screen.getByRole("button", { name: "Show controls" });
    const panel = document.getElementById("global-preference-panel");

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("aria-hidden", "true");

    await user.click(toggleButton);

    expect(screen.getByRole("button", { name: "Hide controls" })).toHaveAttribute("aria-expanded", "true");
    expect(panel).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByRole("group", { name: "Toggle language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle theme mode" })).toBeInTheDocument();
  });
});
