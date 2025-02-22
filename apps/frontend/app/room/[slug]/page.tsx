import { CanvasPage } from "@/components/CanvasPage";
import { HTTP_URL } from "@/config";
import axios from "axios";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;

  try {
    const response = await axios.get(`${HTTP_URL}/room/${slug}`);
    const roomId = response.data.id;

    return <CanvasPage roomId={roomId} />;
  } catch (e) {
    return <div>Invalid slug</div>;
  }
}
