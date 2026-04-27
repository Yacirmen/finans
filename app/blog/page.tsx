import { BlogSection } from "../../components/BlogSection";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";

export default function BlogPage() {
  return (
    <>
      <Header active="blog" />
      <main className="pb-16">
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}
