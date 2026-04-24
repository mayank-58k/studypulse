import SkeletonLoader from "./SkeletonLoader";

export default function Spinner({ text = "Loading..." }) {
  return (
    <div className="card p-5 min-h-[170px] flex flex-col justify-center gap-4">
      <p className="text-sm text-white/65 font-heading">{text}</p>
      <SkeletonLoader count={3} height="h-4" />
    </div>
  );
}
