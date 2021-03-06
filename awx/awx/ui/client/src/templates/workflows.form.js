/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

/**
 * @ngdoc function
 * @name forms.function:Workflow
 * @description This form is for adding/editing a Workflow
*/

export default ['NotificationsList', 'i18n', function(NotificationsList, i18n) {
    return function() {
        var WorkflowFormObject = {

            addTitle: i18n._('NEW WORKFLOW JOB TEMPLATE'),
            editTitle: '{{ name }}',
            name: 'workflow_job_template',
            breadcrumbName: i18n._('WORKFLOW'),
            base: 'workflow',
            basePath: 'workflow_job_templates',
            // the top-most node of generated state tree
            stateTree: 'templates',
            activeEditState: 'templates.editWorkflowJobTemplate',
            tabs: true,
            detailsClick: "$state.go('templates.editWorkflowJobTemplate')",
            include: ['/static/partials/survey-maker-modal.html'],

            headerFields: {
                missingTemplates: {
                    type: 'html',
                    html: `<div ng-show="missingTemplates" class="Workflow-warning">
                            <span class="Workflow-warningIcon fa fa-warning"></span>` +
                            i18n._("Missing Job Templates found in the <span class='Workflow-warningLink' ng-click='openWorkflowMaker()'>Workflow Editor</span>") +
                            `</div>`
                }
            },

            fields: {
                name: {
                    label: i18n._('Name'),
                    type: 'text',
                    required: true,
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)',
                    column: 1
                },
                description: {
                    label: i18n._('Description'),
                    type: 'text',
                    column: 1,
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                },
                organization: {
                    label: i18n._('Organization'),
                    type: 'lookup',
                    sourceModel: 'organization',
                    basePath: 'organizations',
                    list: 'OrganizationList',
                    sourceField: 'name',
                    dataTitle: i18n._('Organization'),
                    dataContainer: 'body',
                    dataPlacement: 'right',
                    awRequiredWhen: {
                        reqExpression: '!current_user.is_superuser'
                    },
                    column: 1,
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate) || !canEditOrg',
                    awLookupWhen: '(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate) && canEditOrg'
                },
                inventory: {
                    label: i18n._('Inventory'),
                    type: 'lookup',
                    lookupMessage: i18n._("This inventory is applied to all job template nodes that prompt for an inventory."),
                    basePath: 'inventory',
                    list: 'InventoryList',
                    sourceModel: 'inventory',
                    sourceField: 'name',
                    autopopulateLookup: false,
                    column: 1,
                    awPopOver: "<p>" + i18n._("Select an inventory for the workflow. This inventory is applied to all job template nodes that prompt for an inventory.") + "</p>",
                    dataTitle: i18n._('Inventory'),
                    dataPlacement: 'right',
                    dataContainer: "body",
                    subCheckbox: {
                        variable: 'ask_inventory_on_launch',
                        ngChange: 'workflow_job_template_form.inventory_name.$validate()',
                        text: i18n._('Prompt on launch')
                    },
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate) || !canEditInventory',
                },
                labels: {
                    label: i18n._('Labels'),
                    type: 'select',
                    ngOptions: 'label.label for label in labelOptions track by label.value',
                    multiSelect: true,
                    dataTitle: i18n._('Labels'),
                    dataPlacement: 'right',
                    awPopOver: "<p>" + i18n._("Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.") + "</p>",
                    dataContainer: 'body',
                    onError: {
                        ngShow: 'workflow_job_template_labels_isValid !== true',
                        text: i18n._('Max 512 characters per label.'),
                    },
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                },
                variables: {
                    label: i18n._('Extra Variables'),
                    type: 'textarea',
                    class: 'Form-textAreaLabel Form-formGroup--fullWidth',
                    rows: 6,
                    "default": "---",
                    column: 2,
                    awPopOver:i18n._('Pass extra command line variables to the playbook. This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the Ansible Tower documentation for example syntax.'),
                    dataTitle: i18n._('Extra Variables'),
                    dataPlacement: 'right',
                    dataContainer: "body",
                    subCheckbox: {
                        variable: 'ask_variables_on_launch',
                        text: i18n._('Prompt on launch')
                    },
                    ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)' // TODO: get working
                },
                checkbox_group: {
                    label: i18n._('Options'),
                    type: 'checkbox_group',
                    fields: [{
                        name: 'allow_simultaneous',
                        label: i18n._('Enable Concurrent Jobs'),
                        type: 'checkbox',
                        column: 2,
                        awPopOver: "<p>" + i18n._("If enabled, simultaneous runs of this workflow job template will be allowed.") + "</p>",
                        dataPlacement: 'right',
                        dataTitle: i18n._('Enable Concurrent Jobs'),
                        dataContainer: "body",
                        ngDisabled: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                    }]
                }
            },

            buttons: { //for now always generates <button> tags
                cancel: {
                    ngClick: 'formCancel()',
                    ngShow: '(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                },
                close: {
                    ngClick: 'formCancel()',
                    ngShow: '!(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                },
                save: {
                    ngClick: 'formSave()',    //$scope.function to call on click, optional
                    ngDisabled: "workflow_job_template_form.$invalid || can_edit!==true", //Disable when $pristine or $invalid, optional and when can_edit = false, for permission reasons
                    ngShow: '(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                },
                launch: {
                    component: 'at-launch-template',
                    templateObj: 'workflow_job_template_obj',
                    ngShow: '(workflow_job_template_obj.summary_fields.user_capabilities.start || canAddWorkflowJobTemplate)',
                    ngDisabled: 'disableLaunch || workflow_job_template_form.$dirty',
                    showTextButton: 'true'
                }
            },

            related: {
                permissions: {
                    name: 'permissions',
                    awToolTip: i18n._('Please save before assigning permissions.'),
                    dataPlacement: 'top',
                    basePath: 'api/v2/workflow_job_templates/{{$stateParams.workflow_job_template_id}}/access_list/',
                    search: {
                        order_by: 'username'
                    },
                    type: 'collection',
                    title: i18n._('Permissions'),
                    iterator: 'permission',
                    index: false,
                    open: false,
                    ngClick: "$state.go('templates.editWorkflowJobTemplate.permissions')",
                    actions: {
                        add: {
                            ngClick: "$state.go('.add')",
                            label: i18n._('Add'),
                            awToolTip: i18n._('Add a permission'),
                            actionClass: 'at-Button--add',
                            actionId: 'button-add',
                            ngShow: '(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)'
                        }
                    },

                    fields: {
                        username: {
                            key: true,
                            label: i18n._('User'),
                            linkBase: 'users',
                            columnClass: 'col-sm-3 col-xs-4'
                        },
                        role: {
                            label: i18n._('Role'),
                            type: 'role',
                            nosort: true,
                            columnClass: 'col-sm-4 col-xs-4'
                        },
                        team_roles: {
                            label: i18n._('Team Roles'),
                            type: 'team_roles',
                            nosort: true,
                            columnClass: 'col-sm-5 col-xs-4'
                        }
                    }
                },
                "notifications": {
                    include: "NotificationsList"
                },
                "completed_jobs": {
                    title: i18n._('Completed Jobs'),
                    skipGenerator: true,
                    ngClick: "$state.go('templates.editWorkflowJobTemplate.completed_jobs')"
                },
                "schedules": {
                    title: i18n._('Schedules'),
                    skipGenerator: true,
                    ngClick: "$state.go('templates.editWorkflowJobTemplate.schedules')"
                }
            },

            relatedButtons: {
                view_survey: {
                    ngClick: 'editSurvey()',
                    awFeature: 'surveys',
                    ngShow: '($state.is(\'templates.addWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate.workflowMaker\')) && survey_exists && !(workflow_job_template_obj.summary_fields.user_capabilities.edit || canAddWorkflowJobTemplate)',
                    label: i18n._('View Survey'),
                    class: 'Form-primaryButton'
                },
                add_survey: {
                    ngClick: 'addSurvey()',
                    ngShow: '!survey_exists && ($state.is(\'templates.addWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate.workflowMaker\'))',
                    awFeature: 'surveys',
                    awToolTip: '{{surveyTooltip}}',
                    dataPlacement: 'top',
                    label: i18n._('Add Survey'),
                    class: 'Form-primaryButton'
                },
                edit_survey: {
                    ngClick: 'editSurvey()',
                    awFeature: 'surveys',
                    ngShow: 'survey_exists && ($state.is(\'templates.addWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate.workflowMaker\'))',
                    label: i18n._('Edit Survey'),
                    class: 'Form-primaryButton',
                    awToolTip: '{{surveyTooltip}}',
                    dataPlacement: 'top'
                },
                workflow_visualizer: {
                    ngClick: 'openWorkflowMaker()',
                    ngShow: '$state.is(\'templates.addWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate\') || $state.is(\'templates.editWorkflowJobTemplate.workflowMaker\')',
                    awToolTip: '{{workflowVisualizerTooltip}}',
                    dataPlacement: 'top',
                    label: i18n._('Workflow Visualizer'),
                    class: 'Form-primaryButton'
                }
            }
        };

        var itm;

        for (itm in WorkflowFormObject.related) {
            if (WorkflowFormObject.related[itm].include === "NotificationsList") {
                WorkflowFormObject.related[itm] = _.clone(NotificationsList);
                WorkflowFormObject.related[itm].ngClick = "$state.go('templates.editWorkflowJobTemplate.notifications')";
                WorkflowFormObject.related[itm].generateList = true;   // tell form generator to call list generator and inject a list
            }
        }

        return WorkflowFormObject;
    };
}];
