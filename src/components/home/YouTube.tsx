interface Props {
    id: string;
    title?: string;
    start?: number; // start time in seconds
}

export default function YouTube({ id, title = "YouTube video", start }: Props) {
    const src = `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ""}`;

    return (
        <div className="my-6 overflow-hidden rounded-xl shadow-lg">
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                    src={src}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                    }}
                />
            </div>
        </div>
    );
}