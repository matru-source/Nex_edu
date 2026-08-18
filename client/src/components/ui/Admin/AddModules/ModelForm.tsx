import { ChevronDown, ChevronUp, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import TopicForm from "./TopicForm";

interface ModuleFormProps {
  moduleIndex: number;
  register: any;
  control: any;
  errors: any;
  onRemoveModule: () => void;
  canRemove: boolean;
}

export default function ModuleForm({ moduleIndex, register, control, errors, onRemoveModule, canRemove }: ModuleFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.topics`
  });

  const addTopic = () => {
    appendTopic({
      title: "",
      content: "",
      videoUrl: ""
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">

            <div className="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center font-semibold">
              {moduleIndex + 1}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Module {moduleIndex + 1}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {canRemove && (
              <button
                type="button"
                onClick={onRemoveModule}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove module"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-5 mt-8">
            {/* Module Title */}
            <div>
              <label htmlFor={`modules.${moduleIndex}.title`} className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                {...register(`modules.${moduleIndex}.title`)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter module title"
              />
              {errors?.modules?.[moduleIndex]?.title && (
                <p className="text-red-500 text-sm mt-2">{errors.modules[moduleIndex].title.message}</p>
              )}
            </div>

            {/* Module Description */}
            <div>
              <label htmlFor={`modules.${moduleIndex}.description`} className="block text-sm font-medium text-gray-700 mb-2">
                Module Description *
              </label>
              <textarea
                {...register(`modules.${moduleIndex}.description`)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-vertical"
                placeholder="Describe what students will learn in this module"
              />
              {errors?.modules?.[moduleIndex]?.description && (
                <p className="text-red-500 text-sm mt-2">{errors.modules[moduleIndex].description.message}</p>
              )}
            </div>

            {/* Topics Section */}
            <div className="space-y-4">
              {topicFields.map((topicField, topicIndex) => (
                <TopicForm
                  key={topicField.id}
                  moduleIndex={moduleIndex}
                  topicIndex={topicIndex}
                  register={register}
                  errors={errors}
                  onRemoveTopic={() => removeTopic(topicIndex)}
                  canRemove={topicFields.length > 1}
                  control={control}
                />
              ))}

              {topicFields.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No topics added yet</p>
                </div>
              )}

              <div className="flex justify-center items-center">
                <button
                  type="button"
                  onClick={addTopic}
                  className="flex items-center gap-2 bg-cyan-50 text-cyan-600 px-3 py-2 rounded-lg font-medium hover:bg-cyan-100 transition-colors text-xs border border-cyan-200"
                >
                  <Plus size={16} />
                  Add Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}