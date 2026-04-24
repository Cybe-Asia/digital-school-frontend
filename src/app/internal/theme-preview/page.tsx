import type { Metadata } from "next";
import { paletteOptions, type ThemeId } from "@/components/theme-config";
import ThemePreviewContent from "@/components/theme-preview-content";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

export const metadata: Metadata = {
  title: "Theme Preview | TWSI",
  description: "Isolated preview frame for a single theme variant.",
};

type ThemePreviewPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

const validThemeIds = new Set<ThemeId>(
  paletteOptions.flatMap((option) => [`${option.id}-light`, `${option.id}-dark`] as ThemeId[]),
);

function getThemeId(value: string | string[] | undefined): ThemeId {
  const candidate = getSingleSearchParam(value);

  if (candidate && validThemeIds.has(candidate as ThemeId)) {
    return candidate as ThemeId;
  }

  return "option2-light";
}

export default async function ThemePreviewPage({ searchParams }: ThemePreviewPageProps) {
  const params = await searchParams;
  const themeId = getThemeId(params.theme);

  return <ThemePreviewContent themeId={themeId} />;
}
