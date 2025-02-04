import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import ButtonSignin from "./ButtonSignin";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Hero = () => {
  const { data: session } = useSession();
  return (
    <section className="max-w-5xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4 mt-20">
          Turn Posts into
          <span className="block">Stunning Screenshots.</span>
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Easily capture and customize high-quality screenshots of Instagram and
          Twitter posts. Add themes, remove watermarks, and make your content
          stand out.
        </p>

        {session && session.user ? (
          <Link href="/#pricing" className="btn btn-primary w-full">
            Get Started
          </Link>
        ) : (
          <ButtonSignin extraStyle={"btn-primary"} text="Get Started" />
        )}

        <TestimonialsAvatars priority={true} />
      </div>
      <div className="lg:w-full">
        <Image
          src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
          alt="Product Demo"
          className="w-full"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
