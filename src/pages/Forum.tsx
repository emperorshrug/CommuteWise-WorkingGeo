import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, MapPin } from "lucide-react";

export default function Community() {
  const posts = [
    {
      id: 1,
      user: "Juan D.",
      content: "Traffic heavy at Visayas Ave junction!",
      time: "10m ago",
      likes: 12,
    },
    {
      id: 2,
      user: "Maria C.",
      content: "Tricycle terminal at Tandang Sora is moving fast today.",
      time: "1h ago",
      likes: 8,
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Community</h1>
        <Button size="sm" className="bg-blue-600">
          + New Post
        </Button>
      </div>

      {posts.map((post) => (
        <Card key={post.id} className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {post.user.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{post.user}</div>
                  <div className="text-xs text-slate-400">{post.time}</div>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                <MapPin size={10} /> Tandang Sora
              </span>
            </div>
            <p className="text-sm text-slate-700 mb-3">{post.content}</p>
            <div className="flex gap-4 text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                <ThumbsUp size={14} /> {post.likes}
              </span>
              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                <MessageSquare size={14} /> Reply
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
