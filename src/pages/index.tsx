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
  return {
    props: {
      myObject: {
        foo: "bar",
      },
    },
  };
};
