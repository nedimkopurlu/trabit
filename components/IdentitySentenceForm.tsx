"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export function IdentitySentenceForm() {
  const { user, identitySentence, setIdentitySentence } = useAuth();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(identitySentence || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setInputValue(identitySentence || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(identitySentence || "");
  };

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      addToast("Kimlik cümlesi boş olamaz", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await setIdentitySentence(trimmed);
      addToast("✓ Kimlik cümlesi güncellendi", "success");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update identity sentence:", error);
      addToast("Güncelleme başarısız oldu", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          maxLength={100}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Kimlik cümlesi giriniz"
          className="w-full px-3 py-2 rounded-lg bg-surface text-fg border border-medium/30 focus:outline-none focus:ring-2 focus:ring-medium"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-surface text-fg border border-medium/30 hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-fg">
        {identitySentence || "Henüz ayarlanmamış"}
      </p>
      <button
        onClick={handleEdit}
        className="px-4 py-2 rounded-lg bg-surface text-fg hover:opacity-80 transition-opacity"
      >
        Düzenle
      </button>
    </div>
  );
}
