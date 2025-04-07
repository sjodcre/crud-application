import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dryrun, message, result, createDataItemSigner } from "@permaweb/aoconnect";
import { processId, TAGS } from "../../shared/config/aoConfig";


export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (id) fetchPostById(id);
  }, [id]);

  const fetchPostById = async (postId: string) => {
    const dryrunResponse = await dryrun({
      process: processId,
      tags: TAGS.READ,
    });

    const data = JSON.parse(dryrunResponse.Messages[0].Data || "[]");
    const post = data.find((p: any) => p.AutoID.toString() === postId);

    if (post) {
      setTitle(post.Title);
      setBody(post.Body);
    }
  };

  const updatePost = async () => {

    if (!id) return;

    const msgRes = await message({
      process: processId,
      tags: [
        ...TAGS.UPDATE,
        { name: "AutoID", value: id },
        { name: "Title", value: title },
        { name: "Body", value: body },
      ],
      signer: createDataItemSigner((globalThis as any).arweaveWallet),
      data: "",
    });

    const updateResult = await result({ process: processId, message: msgRes });

    console.log("Update  successfully", updateResult);
    console.log(updateResult.Messages[0].Data);

    alert("Post updated!");
    navigate("/"); // back to list
  };

  return (
    <div className="p-6 bg-zinc-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full px-4 py-2 mb-4 bg-zinc-800 border border-zinc-700 rounded"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Body"
        rows={6}
        className="w-full px-4 py-2 mb-4 bg-zinc-800 border border-zinc-700 rounded resize-none"
      />
      <button
        onClick={updatePost}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Save Changes
      </button>
    </div>
  );
}
