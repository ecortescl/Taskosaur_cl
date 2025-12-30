"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ActionButton from "@/components/common/ActionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HiPencil, HiCamera } from "react-icons/hi2";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Button } from "../ui";
import React from "react";
import Tooltip from "../common/ToolTip";

export default function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { getCurrentUser, updateUser, uploadFileToS3, getUserById } = useAuth();

  // Store the current user and profile data
  const [currentUser, setCurrentUser] = useState(null);
  const fetchingRef = useRef(false);
  const currentUserRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    mobileNumber: "",
    bio: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load and synchronize current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [getCurrentUser]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      if (currentUserRef.current?.id === currentUser.id) return;
      currentUserRef.current = currentUser;
      // Fetch latest profile data for this user
      const profileResult = await getUserById(currentUser.id);
      setProfileData({
        firstName: profileResult?.firstName ?? "",
        lastName: profileResult?.lastName ?? "",
        email: profileResult?.email ?? "",
        username: profileResult?.username ?? "",
        mobileNumber: profileResult?.mobileNumber ?? "",
        bio: profileResult?.bio ?? "",
      });
      // Optionally refresh currentUser reference since avatar may be changed
      setCurrentUser(profileResult);
    };
    loadProfile();
  }, [currentUser, getUserById]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUploadButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, seleccione un archivo de imagen válido.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfilePicUpload = useCallback(async () => {
    if (!selectedFile || !currentUser) return;
    setUploadingProfilePic(true);
    try {
      const uploadResult = await uploadFileToS3(selectedFile, "avatar");
      const updatedUser = await updateUser(currentUser.id, { avatar: uploadResult.key });
      toast.success("¡Foto de perfil actualizada con éxito!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh user's avatar for immediate UI update
      setCurrentUser(updatedUser);
    } catch {
      toast.error("Error al subir la foto de perfil. Por favor, inténtelo de nuevo.");
    } finally {
      setUploadingProfilePic(false);
    }
  }, [selectedFile, currentUser, uploadFileToS3, updateUser]);

  const handleProfileSubmit = async () => {
    if (!currentUser || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      // Update main profile fields
      const updatedUser = await updateUser(currentUser.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        mobileNumber: profileData.mobileNumber,
        bio: profileData.bio,
      });
      toast.success("¡Perfil actualizado con éxito!");
      setIsEditing(false);
      // Refresh UI with updated user profile
      setCurrentUser(updatedUser);
    } catch {
      toast.error("Error al actualizar el perfil. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      username: currentUser?.username || "",
      mobileNumber: currentUser?.mobileNumber || "",
      bio: currentUser?.bio || "",
    });
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Resolve avatar src depending on preview, S3, or local
  let avatarSrc = "";
  if (previewUrl) {
    avatarSrc = previewUrl;
  } else if (currentUser?.avatar) {
    if (/^https?:\/\//.test(currentUser.avatar)) {
      avatarSrc = currentUser.avatar; // S3 or external
    } else {
      avatarSrc = `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${currentUser.avatar}`; // Local
    }
  }
  return (
    <div className="pt-5">
      {/* Header */}
      {!isEditing && (
        <div className="flex flex-row-reverse items-start">
          <Tooltip content="Editar Perfil" position="top" color="dark">
            <Button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-md hover:bg-[var(--accent)] transition-colors ml-auto shadow-none"
            >
              <HiPencil className="w-4 h-4 text-[var(--primary)]" />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Content */}
      <div className="flex gap-8">
        <div className="flex flex-col items-center space-y-4 min-w-[200px]">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-[var(--border)]">
              {avatarSrc && (
                <AvatarImage
                  src={avatarSrc}
                  alt={
                    `${profileData.firstName} ${profileData.lastName}`.trim() || "Foto de Perfil"
                  }
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-[var(--primary)] text-[var(--primary-foreground)] font-medium text-lg">
                {`${profileData.firstName?.charAt(0) || ""}${profileData.lastName?.charAt(0) || ""}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Avatar overlay on hover */}
            {isEditing && (
              <div
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleUploadButtonClick}
              >
                <HiCamera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Username */}
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              @{profileData.username || "username"}
            </p>
          </div>

          {/* Upload/Save Button - Only in edit mode */}
          {isEditing && (
            <div className="">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <ActionButton
                  type="button"
                  secondary
                  onClick={handleProfilePicUpload}
                  disabled={uploadingProfilePic}
                  className="text-sm w-full"
                >
                  {uploadingProfilePic ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Subiendo...
                    </div>
                  ) : (
                    "Guardar Foto"
                  )}
                </ActionButton>
              ) : (
                <ActionButton
                  type="button"
                  secondary
                  onClick={handleUploadButtonClick}
                  disabled={uploadingProfilePic}
                  className="text-sm w-full"
                >
                  Subir Foto
                </ActionButton>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Conditional Content */}
        <div className="flex-1">
          {isEditing ? (
            /* Edit Mode - Form Fields */
            <div className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--foreground)]">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="bg-[var(--background)] border-[var(--border)] text-xs"
                  placeholder="Ingrese su nombre"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--foreground)]">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="bg-[var(--background)] border-[var(--border)] text-xs"
                  placeholder="Ingrese su apellido"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--foreground)]">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-[var(--background)] border-[var(--border)] text-xs"
                  placeholder="Ingrese su dirección de email"
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Enviaremos un email de verificación si la dirección cambia.
                </p>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--foreground)]">
                  Número de Celular
                </Label>
                <Input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value,
                    }))
                  }
                  className="bg-[var(--background)] border-[var(--border)] text-xs"
                  placeholder="Ingrese su número de celular"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--foreground)]">Biografía</Label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-md resize-none bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="Cuéntenos sobre usted..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 -mt-2">
                <ActionButton
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]"
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  onClick={handleProfileSubmit}
                  disabled={
                    loading ||
                    !profileData.firstName.trim() ||
                    !profileData.lastName.trim() ||
                    !profileData.email.trim() ||
                    !profileData.username.trim()
                  }
                  primary
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Actualizando...
                    </div>
                  ) : (
                    "Actualizar Información"
                  )}
                </ActionButton>
              </div>
            </div>
          ) : (
            /* Display Mode - User Details as Paragraphs */
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Nombre Completo</h4>
                <p className="text-[var(--foreground)] text-sm">
                  {`${profileData.firstName} ${profileData.lastName}`.trim() || "No proporcionado"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Email</h4>
                <p className="text-[var(--foreground)] text-sm">
                  {profileData.email || "No proporcionado"}
                </p>
              </div>

              {profileData.mobileNumber && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
                    Número de Celular
                  </h4>
                  <p className="text-[var(--foreground)] text-sm">{profileData.mobileNumber}</p>
                </div>
              )}

              {profileData.bio && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Biografía</h4>
                  <p className="text-[var(--foreground)] leading-6 text-sm">{profileData.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
