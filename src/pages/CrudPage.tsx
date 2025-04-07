import { useEffect, useState } from "react";
import { message, result, dryrun, createDataItemSigner } from "@permaweb/aoconnect";
import { processId, TAGS } from "../shared/config/aoConfig";

type Post = {
    id: number;
    title: string;
    body: string;
    timestamp: number;
};

export default function CrudPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleUpdateRedirect = (id: number) => {
        window.location.href = `/edit/${id}`; // go to update page
    };

    const handleDeletePost = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await message({
                process: processId,
                tags: [...TAGS.DELETE, { name: "AutoID", value: id.toString() }],
                signer: createDataItemSigner((globalThis as any).arweaveWallet),
                data: "",
            });

            await result({ process: processId, message: res });
            fetchPosts();
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await dryrun({ process: processId, tags: TAGS.READ });

            const rawData = JSON.parse(response.Messages?.[0]?.Data || "[]");

            const formatted: Post[] = rawData.map((item: any) => ({
                id: item.AutoID,
                title: item.Title,
                body: item.Body,
                timestamp: item.Timestamp,
            }));

            setPosts(formatted);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        }
    };

    const addPost = async () => {
        if (!title.trim() || !body.trim()) return;

        try {
            const res = await message({
                process: processId,
                tags: [...TAGS.CREATE, { name: "Title", value: title }, { name: "Body", value: body }],
                signer: createDataItemSigner((globalThis as any).arweaveWallet),
                data: "",
            });

            await result({ process: processId, message: res });
            setTitle("");
            setBody("");
            fetchPosts();
        } catch (err) {
            console.error("Failed to add post:", err);
        }
    };

    return (
        <div className="p-6 text-white bg-zinc-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">📦 Posts</h1>

            <div className="grid gap-3 mb-4">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post Title"
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Post Body"
                    rows={4}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white resize-none"
                />
                <button
                    onClick={addPost}
                    className="w-fit px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                >
                    Add Post
                </button>
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <p className="text-zinc-400">No posts yet.</p>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-zinc-800 border border-zinc-700 rounded p-4">
                            <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                            <p className="text-sm text-zinc-400">{post.body}</p>
                            <p className="text-xs text-zinc-500 mt-2">
                                {new Date(post.timestamp).toLocaleString()}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    onClick={() => handleUpdateRedirect(post.id)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
