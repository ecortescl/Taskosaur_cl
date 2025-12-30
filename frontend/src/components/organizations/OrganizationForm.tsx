import { useState } from "react";
import { useRouter } from "next/navigation";
import { Organization, CreateOrganizationDto } from "@/types";
import { Button } from "@/components/ui";
import { organizationApi } from "@/utils/api";

interface OrganizationFormProps {
  organization?: Organization;
  onSuccess?: (organization: Organization) => void;
  onCancel?: () => void;
}

export default function OrganizationForm({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const router = useRouter();
  const isEditing = !!organization;

  const [formData, setFormData] = useState<CreateOrganizationDto>({
    name: organization?.name || "",
    slug: organization?.slug || "",
    description: organization?.description || "",
    website: organization?.website || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre de la organización es obligatorio";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "El slug de la organización es obligatorio";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "El slug solo puede contener letras minúsculas, números y guiones";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Por favor ingresa una URL válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let result: Organization;

      if (isEditing) {
        result = await organizationApi.updateOrganization(organization.id, formData);
      } else {
        result = await organizationApi.createOrganization(formData);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/organizations/${result.slug}`);
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      setErrors({ submit: "Error al guardar la organización. Por favor intenta de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="organizations-form">
      <div className="organizations-form-field">
        <label htmlFor="name" className="form-label-primary">
          Nombre de la Organización *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className="form-input-primary"
          placeholder="Ingresa el nombre de la organización"
          required
        />
        {errors.name && <p className="form-error-text">{errors.name}</p>}
      </div>

      <div className="organizations-form-field">
        <label htmlFor="slug" className="form-label-primary">
          Slug de la Organización *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="form-input-primary"
          placeholder="slug-de-la-organizacion"
          required
        />
        <p className="organizations-form-slug-hint">
          Esto se usará en la URL de tu organización. Solo se permiten letras minúsculas, números y guiones.
        </p>
        {errors.slug && <p className="form-error-text">{errors.slug}</p>}
      </div>

      <div className="organizations-form-field">
        <label htmlFor="description" className="form-label-primary">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="form-textarea-primary"
          placeholder="Describe tu organización..."
        />
      </div>

      <div className="organizations-form-field">
        <label htmlFor="website" className="form-label-primary">
          Sitio Web
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="form-input-primary"
          placeholder="https://tu-sitio-web.com"
        />
        {errors.website && <p className="form-error-text">{errors.website}</p>}
      </div>

      {errors.submit && (
        <div className="form-error-box">
          <p className="form-error-box-text">{errors.submit}</p>
        </div>
      )}

      <div className="organizations-form-actions">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isEditing ? "Actualizar Organización" : "Crear Organización"}
        </Button>
      </div>
    </form>
  );
}
