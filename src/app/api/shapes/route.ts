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

  const shapes = prepared.get(ID) as {
    id: number;
    buffer: Buffer | null;
  } | null;

  if (!shapes) {
    return NextResponse.json({
      data: shapes,
      message: '데이터 없음',
    });
  }

  const decompressedData = shapes.buffer ? decompress(shapes.buffer) : null;

  const deserializedData = decompressedData
    ? deserialize(decompressedData)
    : null;

  return NextResponse.json({
    message: '데이터 있음.',
    data: { id: 0, shapes: deserializedData },
  });
}

export async function PUT(request: NextRequest) {
  const updatedShape = await request.json();
  const { data } = updatedShape;

  const serializedData = data !== null ? serialize(data) : null;

  const compressedData =
    serializedData !== null ? compress(Buffer.from(serializedData)) : null;

  if (compressedData) {
    console.log('msgpack / zlib buffer size', compressedData.length);
  }

  const prepared = db.prepare('UPDATE shapes SET buffer = ? WHERE id = ?');
  const info = prepared.run(compressedData, ID);

  if (info.changes === 0) {
    return NextResponse.json(
      { message: '업데이트할 데이터 없음', data: null },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      id: ID,
      buffer:
        compressedData !== null
          ? Array.from(new Uint8Array(compressedData))
          : null,
    },
    message: '업데이트 완료',
  });
}
