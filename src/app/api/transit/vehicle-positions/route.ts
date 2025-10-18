import { NextResponse } from 'next/server';

const GTFS_RT_VEHICLE_POSITIONS = 'https://gtfs.halifax.ca/realtime/Vehicle/VehiclePositions.pb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(GTFS_RT_VEHICLE_POSITIONS, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('GTFS-RT fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch vehicle positions: ${response.statusText}`, status: response.status },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    console.log('GTFS-RT fetch successful, buffer size:', buffer.byteLength);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error proxying GTFS-RT vehicle positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle positions', details: error.message },
      { status: 500 }
    );
  }
}
