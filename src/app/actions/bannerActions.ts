"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// حفظ أو تحديث بانر
export async function saveBannerAction(formData: FormData) {
  try {
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const buttonText = formData.get("buttonText") as string;
    const type = (formData.get("type") as "PLAZA_ACTIVITY" | "HANOUT_PRODUCT") || "PLAZA_ACTIVITY";
    const sortOrder = Number(formData.get("sortOrder")) || 0;
    const isActive = formData.get("isActive") === "true";

    if (!title || !imageUrl) {
      return { success: false, error: "العنوان والصورة أجباريان." };
    }

    if (id) {
      await prisma.banner.update({
        where: { id },
        data: { title, subtitle, description, imageUrl, linkUrl, buttonText, type, sortOrder, isActive },
      });
    } else {
      await prisma.banner.create({
        data: { title, subtitle, description, imageUrl, linkUrl, buttonText, type, sortOrder, isActive },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "حدث خطأ أثناء حفظ البانر." };
  }
}

// حذف بانر
export async function deleteBannerAction(id: string) {
  try {
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "حدث خطأ أثناء الحذف." };
  }
}