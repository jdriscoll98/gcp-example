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
  return <>{bar}</>;
}

export const getServerSideProps = async () => {
  // context.res.setHeader(
  //   'Cache-Control',
  //   'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
  // );
  const res = await fetch(
    "https://gcp-example-n3padcs3la-uc.a.run.app/text.txt"
  );
  const txt = await res.text();
  console.log(txt)
  return {
    props: {
      myObject: {
        foo: txt,
      },
    },
  };
};
