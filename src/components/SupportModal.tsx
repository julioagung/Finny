import { useState } from 'react'
import { Download, Coffee } from 'lucide-react'
import { Modal, ModalHeader } from './ui/Modal'
import { CreatorCredit } from './ui/CreatorCredit'
import { CREATOR } from '../config'

export function SupportModal({ onClose }: { onClose: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Modal onClose={onClose} className="sm:max-w-[400px]">
      {close => (
        <>
          <ModalHeader emoji="☕" title="Dukung Finny" subtitle="Traktir kopi pembuatnya" onClose={() => close()} />

          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Finny gratis untuk semua. Kalau Finny bantu kamu lebih rapi ngatur uang, kamu bisa dukung pembuatnya lewat QRIS di bawah.
            Berapa pun nominalnya sangat berarti 💗
          </p>

          <div className="relative rounded-3xl border-2 border-dashed border-pink-200 bg-white p-3 mb-3">
            {imgFailed ? (
              <div className="aspect-square flex flex-col items-center justify-center text-center px-6">
                <div className="text-4xl mb-2 float-anim">🧾</div>
                <p className="text-sm font-semibold text-gray-600">QRIS belum tersedia</p>
                <p className="text-xs text-gray-400 mt-1">Coba lagi nanti ya.</p>
              </div>
            ) : (
              <img
                src={CREATOR.qrisSrc}
                alt="QRIS untuk mendukung pembuat Finny"
                onError={() => setImgFailed(true)}
                className="w-full h-auto rounded-2xl pop-in"
              />
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center mb-4">
            Scan pakai aplikasi e-wallet atau m-banking apa pun (GoPay, OVO, DANA, ShopeePay, BCA, dll).
          </p>

          <div className="flex gap-3">
            {!imgFailed && (
              <a href={CREATOR.qrisSrc} download="QRIS-Finny.jpeg" className="btn-outline flex-1">
                <Download size={15} /> Simpan QRIS
              </a>
            )}
            <button onClick={() => close()} className="btn-primary flex-1">
              <Coffee size={15} /> Sudah, makasih!
            </button>
          </div>

          <div className="text-center mt-5">
            <CreatorCredit />
          </div>
        </>
      )}
    </Modal>
  )
}
