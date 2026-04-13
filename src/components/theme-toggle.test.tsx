import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/theme-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

let storage: Record<string, string> = {};

describe("ThemeToggle", () => {
  beforeEach(() => {
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
    document.cookie = "ds-theme-id=; Max-Age=0; Path=/";
    document.documentElement.dataset.theme = "option2-light";
  });

  it("persists the selected theme mode", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider initialLanguage="en">
        <ThemeProvider initialThemeId="option2-light">
          <ThemeToggle />
        </ThemeProvider>
      </LanguageProvider>,
    );

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(storage["ds-theme-id"]).toBe("option2-dark");
    expect(document.cookie).toContain("ds-theme-id=option2-dark");
    expect(document.documentElement.dataset.theme).toBe("option2-dark");
  });
});
