import { GrSync } from "react-icons/gr";
import { TbTools } from "react-icons/tb";
import { FaShapes } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";

export function Features() {
  const tabs = [
    {
      icon: <GrSync size={18} />,
      title: "Real-Time Sync",
      description:
        "Experience instant collaboration. Every change you make is immediately visible to all participants, ensuring seamless teamwork and fluid creative flow.",
    },
    {
      icon: <TbTools size={18} />,
      title: "Tool Customization",
      description:
        "Tailor your workspace to your exact needs. Fine-tune every tool's settings for maximum efficiency and personalized creative expression.",
    },
    {
      icon: <FaShapes size={18} />,
      title: "Shape Manipulation",
      description:
        "Effortlessly create and modify shapes. Resize and reshape elements with intuitive controls, enabling precise design and dynamic compositions.",
    },
    {
      icon: <LuPencilLine size={18} />,
      title: "Freehand Shaping",
      description:
        "Unleash your creativity with natural drawing tools. Sketch, paint, and mold shapes directly on the canvas, fostering organic and expressive artwork",
    },
  ];

  return (
    <section className="z-10 py-10 border-b">
      <div className="max-w-7xl mx-auto p-2">
        <h1 className="text-xl md:text-3xl font-bold py-10">Features</h1>
        <div className="flex flex-col md:flex-row justify-between items-start gap-24 md:gap-10 h-fit mb-20">
          {/* Video frame */}
          <div className="bg-white sticky top-16 md:top-32 z-30 left-0 md:h-fit h-fit w-full md:w-1/2 rounded-md">
            <div className="border border-blue-500 p-2 md:p-4 h-fit">
              <div className="border border-cyan-500 p-2 md:p-4 h-fit">
                <video
                  src="/demo.mp4"
                  className="h-full w-full border border-primary aspect-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                ></video>
              </div>
            </div>
            <div className=""></div>
          </div>

          {/* Text frame */}
          <div className="md:w-1/2 w-full h-fit flex flex-col gap-10">
            {tabs.map((tab, index) => (
              <div
                key={index}
                className="p-5 md:p-10 sticky top-1/2 md:top-32 right-0 h-60 flex flex-col justify-center items-start gap-3 bg-white border-t-2"
              >
                {tab.icon}
                <p className="text-lg md:text-xl font-semibold">{tab.title}</p>
                <p className="text-sm md:text-md max-w-lg">{tab.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
