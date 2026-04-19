import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { fileUploadSchema } from "@/lib/validators"
import { generatePresignedUrl } from "@/lib/s3"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengunggah file" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = fileUploadSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: "Validasi gagal", fieldErrors: errors },
        { status: 400 }
      )
    }

    const { filename, contentType } = parsed.data
    const result = await generatePresignedUrl(filename, contentType)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Presign URL error:", error)
    return NextResponse.json(
      { error: "Gagal menghasilkan URL upload. Silakan coba lagi." },
      { status: 500 }
    )
  }
}
