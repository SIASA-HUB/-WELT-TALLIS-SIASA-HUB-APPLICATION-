import React, { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Send } from "lucide-react";
// Assumes Bootstrap 5 CSS is imported in your index.js or App.js

const PollCreator = () => {
  const [poll, setPoll] = useState({
    question: "",
    category: "General",
    options: [
      { id: "opt-1", label: "" },
      { id: "opt-2", label: "" },
    ],
  });

  const addOption = () => {
    const newId = `opt-${poll.options.length + 1}`;
    setPoll({ ...poll, options: [...poll.options, { id: newId, label: "" }] });
  };

  const removeOption = (id) => {
    if (poll.options.length > 2) {
      setPoll({ ...poll, options: poll.options.filter((o) => o.id !== id) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending to Knex Backend:", poll);
    // Add your fetch call here
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <h2 className="h4 fw-bold text-dark mb-4">Create New Poll</h2>

            <form onSubmit={handleSubmit}>
              {/* Question Input */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary text-uppercase">
                  The Question
                </label>
                <textarea
                  className="form-control form-control-lg border-0 bg-light rounded-3"
                  placeholder="What's on your mind?"
                  rows="3"
                  value={poll.question}
                  style={{ resize: "none" }}
                  onChange={(e) =>
                    setPoll({ ...poll, question: e.target.value })
                  }
                  required
                />
              </div>

              {/* Options List */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary text-uppercase mb-3">
                  Choices
                </label>

                {poll.options.map((option, index) => (
                  <div
                    key={option.id}
                    className="input-group mb-2 shadow-none group"
                  >
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className="form-control border-light-subtle py-2 px-3"
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...poll.options];
                        newOptions[index].label = e.target.value;
                        setPoll({ ...poll, options: newOptions });
                      }}
                      required
                    />
                    {poll.options.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger border-light-subtle"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOption}
                  className="btn btn-link text-decoration-none fw-semibold p-0 mt-2 d-flex align-items-center gap-1"
                >
                  <Plus size={18} /> Add another option
                </button>
              </div>

              <hr className="my-4 opacity-10" />

              {/* Footer Actions */}
              <div className="d-flex align-items-center justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-light text-secondary d-flex align-items-center gap-2 px-3"
                >
                  <ImageIcon size={18} />
                  <span className="d-none d-sm-inline">Add Image</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 rounded-3 shadow-sm"
                >
                  <Send size={18} /> Launch Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;
