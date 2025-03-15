import { CanvasPage } from "@/components/canvas/CanvasPage";
import { HTTP_URL } from "@/config";
import axios from "axios";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  try {
    const response = await axios.get(`${HTTP_URL}/room/${slug}`);
    const roomId = response.data.id;

    return <CanvasPage roomId={roomId} />;
  } catch (e) {
    console.log(HTTP_URL);
    console.log(e);

    return (
      <div className="h-screen flex flex-col justify-center items-center gap-3">
        <p className="text-2xl">Invalid Room Name</p>
        <p className="text-md">
          Go to{" "}
          <Link href={"/dashboard"} className="underline text-blue-500">
            dashboard
          </Link>
        </p>
      </div>
    );
  }
}
