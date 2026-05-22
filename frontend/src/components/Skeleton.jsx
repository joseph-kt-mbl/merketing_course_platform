const Skeleton = ({ height = 20, width = "100%" }) => {
    return (
      <div
        style={{
          height,
          width,
          backgroundColor: "#e0e0e0",
          borderRadius: "6px",
          marginBottom: "10px",
          animation: "pulse 1.5s infinite",
        }}
      />
    );
  };

export default Skeleton;