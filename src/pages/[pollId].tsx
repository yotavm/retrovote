import { type NextPage } from "next";
import { useRouter } from "next/router";

const Poll: NextPage = () => {
  const router = useRouter();
  const { pollId } = router.query;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center">
        <div>{pollId}</div>
      </div>
    </main>
  );
};

export default Poll;
