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
