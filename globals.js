/**
 * Callback method for when solution is opened.
 * When deeplinking into solutions, the argument part of the deeplink url will be passed in as the first argument
 * All query parameters + the argument of the deeplink url will be passed in as the second argument
 * For more information on deeplinking, see the chapters on the different Clients in the Deployment Guide.
 *
 * @param {String} arg startup argument part of the deeplink url with which the Client was started
 * @param {Object<Array<String>>} queryParams all query parameters of the deeplink url with which the Client was started
 *
 * @properties={typeid:24,uuid:"F4BA5D64-A543-46AF-B03E-F9288068FACA"}
 * @AllowToRunInFind
 */
function ma_PresenzaSempliceLite_onSolutionOpen(arg, queryParams) 
{
	if (ma_sec_onSolutionOpen(arg, queryParams))
	{
		application.putClientProperty(APP_WEB_PROPERTY.WEBCLIENT_TEMPLATES_DIR, 'psl');
		application.putClientProperty(APP_UI_PROPERTY.TABLEVIEW_WC_DEFAULT_SCROLLABLE, true);
		
		globals.ma_nav_customLookupName = forms.psl_lookup_window.controller.getName();
		globals.ma_nav_lookupStyle = 'psl';
		globals.nav_styleForm = forms.psl_nav_style_custom.controller.getName();
		globals.Colors.SELECTED = { background: '#E2007A', foreground: '#FFFFFF' };
		globals.Colors.ACTIVE   = { background: '#172983', foreground: '#FFFFFF' };
		
		globals.vUpdateOperationStatusFunction = forms.psl_mao_history.checkStatusCallback;
		
		// escludi le ditte con esterni
		databaseManager.addTableFilterParam(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE, 'tipologia', globals.ComparisonOperator.EQ, 0);
		
		// imposta gli indirizzo per gli avvisi email
		var sqlQuery = "select [from], [to], cc, bcc from psl_settings_email where [key] = ?;";
		
		var dataset = databaseManager.getDataSetByQuery(globals.Server.MA_FRAMEWORK, sqlQuery, ['pratiche.alert'], 1);
		if (dataset && dataset.getMaxRowIndex() > 0)
		{
			scopes.psl.Pratiche.EMail.FROM = dataset.getValue(1, 1);
			scopes.psl.Pratiche.EMail.TO   = dataset.getValue(1, 2);
			scopes.psl.Pratiche.EMail.CC   = dataset.getValue(1, 3);
			scopes.psl.Pratiche.EMail.BCC  = dataset.getValue(1, 4);
		}
					
		ma_psl_onSolutionOpen();
		
		forms.psl_nav_main.controller.show();
		
		// Visualizzazione dati news relative al program name StudioMiazzoWebApps
		// (solo per gli utenti in possesso della chiave per la rilevazione delle presenze)
		scopes.news.verificaDatiNews(globals.svy_sec_lgn_owner_id,globals.svy_sec_lgn_user_id,'PresenzaSempliceLite',true);
	}
}

/**
 * @properties={typeid:24,uuid:"226180EA-182F-4232-9FB3-A9E1016C3D3A"}
 */
function process_psl_verifica_ftp()
{
	globals.verificaDatiFtp();
}

/**
 * @properties={typeid:24,uuid:"346B287C-DC2D-48A4-999E-C62959FE48A1"}
 */
function ma_psl_onSolutionOpen()
{
	// Set the callback for the update status of operations
	globals.vOperationDoneFunction = forms.mao_history.operationDone;
	
	// Set the callback for checking operations' status
	globals.vUpdateOperationStatusFunction = forms.mao_history.checkStatusCallback;

	
	// Verifica per le ditte del gruppo se sono presenti sull'ftp dati inviati dalla sede
	// e in caso affermativo lancia la ricezione automatica (nell'ordine tabelle generali/ditta/certificati telematici)
	var params = {
        processFunction: process_psl_verifica_ftp,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : '',
        fontType: 'Arial,4,25',
        processArgs: []
    };
	
	plugins.busy.block(params);
	
}