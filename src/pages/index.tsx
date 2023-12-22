import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  myObject,
}: {
  myObject: {
    foo: "bar";
  };
}) {
  const bar = myObject.foo;
  return <span suppressHydrationWarning>{bar}</span>;
}

export const getServerSideProps = async (context: any) => {
  context.res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
  );
  const res = await fetch(
    "http://localhost:3000/text.json"
  );
  const { data } = await res.json();
  return {
    props: {
      myObject: {
        foo: data,
      },
    },
  };
};
