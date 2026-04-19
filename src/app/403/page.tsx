import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Akses Ditolak
        </h2>
        <p className="mt-2 text-gray-600">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/admin"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Login Ulang
          </Link>
        </div>
      </div>
    </div>
  )
}
