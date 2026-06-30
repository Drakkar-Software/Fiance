import type { BlogSection, BlogPost } from "./blog-types";
import { getBlogPublishDate } from "./blog-publish-dates";

export const BLOG_HERO =
  "https://fiance.drakkar.software/assets/og-image.png";

export const DISCLAIMER_FR: BlogSection = {
  type: "text",
  title: "Avertissement",
  paragraphs: [
    "Veuillez noter que le contenu de cet article est destiné à des fins d'information générale uniquement et ne constitue pas un conseil professionnel. Les informations contenues ici sont fournies à titre informatif. Rien dans ce document ne doit être interprété comme un conseil juridique, financier ou fiscal. Le contenu reflète les opinions de l'auteur et/ou de l'équipe Drakkar Software. L'auteur et/ou Drakkar Software ne garantissent aucun résultat particulier.",
  ],
};

export const DISCLAIMER_EN: BlogSection = {
  type: "text",
  title: "Disclaimer",
  paragraphs: [
    "Please be advised that the contents of this article are intended for general information purposes only and not professional advice. The information contained herein is for informational purposes only. Nothing herein shall be construed as legal, financial, or tax advice. The content reflects the opinions of the author and/or the Drakkar Software team. Drakkar Software does not guarantee any particular outcome.",
  ],
};

export interface PostPairInput {
  slug: string;
  categoryKey: string;
  categoryFr: string;
  categoryEn: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  readingMinutes: number;
  heroAltFr: string;
  heroAltEn: string;
  sectionsFr: BlogSection[];
  sectionsEn: BlogSection[];
  disclaimer?: boolean;
  date?: string;
}

export function postPair(input: PostPairInput): { fr: BlogPost; en: BlogPost } {
  const date = input.date ?? getBlogPublishDate(input.slug);
  const base = {
    slug: input.slug,
    categoryKey: input.categoryKey,
    date,
    readingMinutes: input.readingMinutes,
    heroImage: BLOG_HERO,
  };
  const frSections = input.disclaimer
    ? [...input.sectionsFr, DISCLAIMER_FR]
    : input.sectionsFr;
  const enSections = input.disclaimer
    ? [...input.sectionsEn, DISCLAIMER_EN]
    : input.sectionsEn;
  return {
    fr: {
      ...base,
      category: input.categoryFr,
      title: input.titleFr,
      excerpt: input.excerptFr,
      heroImageAlt: input.heroAltFr,
      sections: frSections,
    },
    en: {
      ...base,
      category: input.categoryEn,
      title: input.titleEn,
      excerpt: input.excerptEn,
      heroImageAlt: input.heroAltEn,
      sections: enSections,
    },
  };
}

export function pairsToArrays(
  pairs: { fr: BlogPost; en: BlogPost }[]
): { fr: BlogPost[]; en: BlogPost[] } {
  return {
    fr: pairs.map((p) => p.fr),
    en: pairs.map((p) => p.en),
  };
}
