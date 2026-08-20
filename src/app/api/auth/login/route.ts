export async function POST() {
  return Response.json(
    { error: "このログイン API は廃止されました。/login を使用してください。" },
    { status: 410 },
  );
}