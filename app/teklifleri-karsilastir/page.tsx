import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { OfferComparisonPage } from "../../components/OfferComparisonPage";

type CompareOffersRouteProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function searchParamsToString(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") query.append(key, item);
      });
      return;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  });

  return query.toString();
}

export default function CompareOffersRoute({ searchParams }: CompareOffersRouteProps) {
  const initialSearch = searchParamsToString(searchParams ?? {});

  return (
    <>
      <Header active="compare" />
      <OfferComparisonPage initialSearch={initialSearch} />
      <Footer />
    </>
  );
}
