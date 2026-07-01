import { Redirect } from "expo-router";

/** Bare "/" has no locale — send visitors to the default (French) marketing site. */
export default function MarketingRoot() {
  return <Redirect href="/fr" />;
}
