import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../initdb';
import msgpack from 'msgpack-lite';
import zlib from 'zlib';

const ID = 0;

const compress = (data: Buffer) => zlib.deflateSync(data);
const decompress = (data: Buffer) => zlib.inflateSync(data);
const serialize = (data: unknown) => msgpack.encode(data);
const deserialize = (data: Buffer) => msgpack.decode(data);

export async function GET() {
  const prepared = db.prepare('SELECT * from shapes WHERE id = ?');

  const data = prepared.get(ID) as {
    id: number;
    buffer: Buffer | null;
    vw: number | null;
    vh: number | null;
  } | null;

  if (!data) {
    return NextResponse.json({
      shapes: null,
      vh: null,
      vw: null,
      message: '데이터 없음',
    });
  }

  const { buffer, vw, vh } = data;

  const decompressedShapes = buffer ? decompress(buffer) : null;

  const deserializedShapes = decompressedShapes
    ? deserialize(decompressedShapes)
    : null;

  return NextResponse.json({
    message: '데이터 있음.',
    id: 0,
    shapes: deserializedShapes,
    vw,
    vh,
  });
}

export async function PUT(request: NextRequest) {
  const updatedShape = await request.json();
  const { shapes, vw, vh } = updatedShape;

  const serializedShapes = shapes !== null ? serialize(shapes) : null;

  const compressedShapes =
    serializedShapes !== null ? compress(Buffer.from(serializedShapes)) : null;

  if (compressedShapes) {
    console.log('msgpack / zlib buffer size', compressedShapes.length);
  }

  const prepared = db.prepare(
    'UPDATE shapes SET buffer = ?, vw = ?, vh = ? WHERE id = ?'
  );
  const info = prepared.run(compressedShapes, vw, vh, ID);

  if (info.changes === 0) {
    return NextResponse.json(
      { message: '업데이트할 데이터 없음', data: null },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: ID,
    buffer: compressedShapes !== null ? compressedShapes : null,
    message: '업데이트 완료',
  });
}
