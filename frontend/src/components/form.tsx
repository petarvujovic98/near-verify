import type { FormEventHandler } from "react";
import React from "react";

type FormProps = {
  onSubmit: FormEventHandler;
};

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <fieldset id="fieldset">
        <p className="highlight">
          <label htmlFor="source">Source:</label>
          <input autoComplete="off" autoFocus id="source" required />
        </p>
        <p>
          <label htmlFor="trust">Trust:</label>
          <input id="trust" type="checkbox" />
        </p>
        <button type="submit">Submit</button>
      </fieldset>
    </form>
  );
};

export default Form;
