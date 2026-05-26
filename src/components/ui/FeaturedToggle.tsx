import { motion } from "framer-motion";
import { useAppDispatch } from "@/store";
import { toggleFeatured } from "@/store/slices/servicesSlice";

export function FeaturedToggle({ id, on }: { id: string; on: boolean }) {
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => dispatch(toggleFeatured(id))}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{ width: 44, height: 24, background: on ? "#7C3AED" : "#D1D5DB" }}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="block bg-white rounded-full shadow"
        style={{ width: 20, height: 20, marginLeft: on ? 22 : 2 }}
      />
    </button>
  );
}
