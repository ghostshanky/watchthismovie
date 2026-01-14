import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'Cinephile';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                    backgroundImage: 'linear-gradient(to bottom right, #111, #000)',
                    color: 'white',
                }}
            >
                {/* We recreate a simplified version of the Card here for the image */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>WATCH THIS MOVIE</div>
                    <div style={{
                        padding: '20px 40px',
                        background: 'linear-gradient(to right, #2563eb, #9333ea)',
                        borderRadius: 20,
                        fontSize: 40,
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 0 50px rgba(147, 51, 234, 0.5)'
                    }}>
                        {username}
                    </div>
                    <div style={{ marginTop: 20, color: '#888', fontSize: 24 }}>CHECK OUT MY TASTE PROFILE</div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
