import { getCategories } from "@/actions/category.actions";
import BlurText from "@/components/animations/blur-text";
import { SplitLines } from "@/components/animations/SplitLines";
import { Category } from "@/types";
import Image from "next/image";
import Link from "next/link";

const Categories = async () => {
  const categories: Category[] = await getCategories();

  return (
    <section className="w-full section-spacing bg-white">
      <div className="flex flex-col gap-10 md:gap-12 lg:gap-14">
        <div className="flex flex-col items-center gap-3 px-4 text-center sm:gap-4 sm:px-0">
  <SplitLines
    text="Categories"
    tag="span"
    className="subtitle"
    duration={0.8}
    stagger={0.02}
    ease="power3.out"
    yPercent={120}
    threshold={0.1}
    rootMargin="-80px"
  />

  <SplitLines
    text="Shop Office Essentials"
    tag="h2"
    className="heading-1"
    duration={1}
    stagger={0.025}
    ease="power3.out"
    yPercent={150}
    threshold={0.1}
    rootMargin="-100px"
    delay={0.05}
  />

  <div className="line-border" />
</div>

        <div
          className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-3
gap-5
lg:gap-6
"
        >
          {categories.map((item) => (
            <div
              key={item._id.toString()}
              className="
    relative
    h-[18rem]
    md:h-[22rem]
    w-full
    min-w-0
    overflow-hidden
    rounded-xl
    border
  "
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

              <div
                className="
      absolute
      bottom-5
      sm:bottom-6
      lg:bottom-8
      left-0
      w-full
      px-5
      sm:px-6
      z-10
    "
              >
                <div className="flex flex-col gap-3 min-w-0">
                  <h4 className="heading-3 text-white">
                    {item.name}
                  </h4>

                  <Link  href={`/shop?filter=${item._id}`} className="btn-primary w-fit whitespace-nowrap">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;