// Design context for node 12:34 "Checkout / Payment" (390 x 844)
export default function CheckoutPayment() {
  return (
    <div className="bg-[#ffffff] px-[16px] pt-[24px]">
      <h1 className="text-[22px] font-bold text-[#1f2937]">Payment</h1>
      <div className="mt-[16px] flex flex-col gap-[12px]">
        <input className="border border-[#e5e7eb] rounded-[8px] p-[12px]" placeholder="Card number" />
        <input className="border border-[#e5e7eb] rounded-[8px] p-[12px]" placeholder="MM/YY" />
        <input className="border border-[#e5e7eb] rounded-[8px] p-[12px]" placeholder="CVC" />
      </div>
      <p className="mt-[8px] text-[11px] text-[#b0b4ba]">A service fee of $2.99 is added at the end.</p>
      <button className="mt-[24px] w-full rounded-[12px] bg-[#6366f1] py-[14px] text-[16px] font-semibold text-[#ffffff]">Submit</button>
    </div>
  );
}
// Components: Input / Text (detached: no), Button / Primary (detached: yes)
