import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

type RouterPollQuery = {
  pollId: string;
};

const Poll: NextPage = () => {
  const router = useRouter();
  const { pollId } = router.query as RouterPollQuery;
  const { data: poll, isLoading } = api.poll.getById.useQuery({ pollId });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center">
        {isLoading && <div>Loading...</div>}
        {poll && <div>{poll.title}</div>}
        {!poll && !isLoading && <div>Not Found</div>}
      </div>
    </main>
  );
};

export default Poll;
