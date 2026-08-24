import Hero from "../components/hero";
import Testimonials from "../components/testimonials";
import FAQ from "../components/faq";
import Products from "../components/products/products";
import Categories from "../components/categories";
import Brands from "../components/brands";
import WhyChooseUs from "../components/why-us";


const HomePage = () => {

  return (
      <main>
        <Hero />
        <Brands />
        <Categories />
        <Products />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
      </main>
  );
};

export default HomePage;