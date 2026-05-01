// const ReportCaseForm = () => {
//   // ... (State and Logic remain the same)
//   return (
//     // onSubmit={handleSubmit}
//     <form  className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-2xl">
//       <h3 className="text-xl font-semibold mb-4 text-amber-500 flex items-center gap-2">
//         <span>⚠️</span> Report Incident
//       </h3>
      
//       <div className="space-y-4">
//         <input 
//           className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none transition-all"
//           placeholder="Incident Title" 
//           required
//           onChange={(e) => setForm({...form, title: e.target.value})}
//         />

//         <textarea 
//           className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none min-h-[100px]"
//           placeholder="Detailed Description" 
//           required
//           onChange={(e) => setForm({...form, description: e.target.value})}
//         />

//         <div className="grid grid-cols-2 gap-4">
//           <input 
//             className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none"
//             placeholder="Type (e.g. Theft)"
//             onChange={(e) => setForm({...form, crimeType: e.target.value})}
//           />
//           <input 
//             className="bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:ring-2 focus:ring-amber-600 outline-none"
//             placeholder="Address/Location"
//             onChange={(e) => setForm({...form, address: e.target.value})}
//           />
//         </div>

//         <button 
//           type="submit" 
//           className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm"
//         >
//           Submit Official Report
//         </button>
//       </div>
//     </form>
//   );
// };

// export default ReportCaseForm