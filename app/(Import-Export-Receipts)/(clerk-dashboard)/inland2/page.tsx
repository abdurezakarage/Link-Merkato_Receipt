// app/transport-fee/page.tsx
import TransportFeeForm from "../components/Inland2";

export default function TransportFeePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Transport Fee Management
      </h1>
      <TransportFeeForm />
    </div>
  );
}
