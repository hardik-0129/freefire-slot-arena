import { HeroBanner } from "@/components/HeroBanner";
import { TournamentSection } from "@/components/TournamentSection";
import { AboutSection } from "@/components/AboutSections";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
       {/* <AnnouncementBar /> */}
      <Header />
      <main className="mx-auto">
        <HeroBanner />
        <section className="mb-12">
          <TournamentSection />
        </section>
        <section className="mb-12">
          <AboutSection />
        </section>
        <section className="mb-12">
          <WhyChooseUs />
        </section>
        <section>
          <FAQ />
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
